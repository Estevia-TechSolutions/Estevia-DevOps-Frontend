import React, { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw, Send, Sparkles, CheckCircle, AlertTriangle, Shield, Server, Cpu } from 'lucide-react';

interface TemplateItem {
  id: string;
  name: string;
  templateName: string;
  appId: string;
  productName: string;
  category: string;
  subject: string;
  description: string;
  sampleData: Record<string, string>;
}

export const EmailTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Split view state
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const [loadingHtml, setLoadingHtml] = useState<boolean>(false);

  // Test Email Modal
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [testRecipient, setTestRecipient] = useState<string>('');
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const getDevOpsEndpoint = (path: string) => {
    let apiBase = (import.meta.env.VITE_DEVOPS_API_URL as string) || (import.meta.env.VITE_API_URL as string) || 'http://localhost:5005';
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
        if (data.templates.length > 0 && !activeTemplate) {
          loadPreview(data.templates[0]);
        }
      }
    } catch (err) {
      console.error('[EvaOps Email Console] Failed to fetch email templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (tmpl: TemplateItem) => {
    setActiveTemplate(tmpl);
    setLoadingHtml(true);
    setTestStatus(null);
    try {
      const res = await fetch(getDevOpsEndpoint(`/${tmpl.id}/preview`));
      const data = await res.json();
      if (data.success && data.html) {
        setCompiledHtml(data.html);
      }
    } catch (err) {
      console.error('[EvaOps Email Console] Failed to load HTML preview:', err);
    } finally {
      setLoadingHtml(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSendTest = async () => {
    if (!activeTemplate || !testRecipient) return;
    setSendingTest(true);
    setTestStatus(null);

    try {
      const res = await fetch(getDevOpsEndpoint('/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: activeTemplate.id,
          recipientEmail: testRecipient
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus({ text: `Test email dispatched to ${testRecipient}`, type: 'success' });
        setTimeout(() => setTestModalOpen(false), 2000);
      } else {
        setTestStatus({ text: data.message || 'Failed to dispatch test email', type: 'error' });
      }
    } catch (err) {
      setTestStatus({ text: 'Error connecting to DevOps Backend API', type: 'error' });
    } finally {
      setSendingTest(false);
    }
  };

  const categories = ['all', 'Deployments & Releases', 'Networking & DNS', 'Monitoring & Health', 'Repository Scanning', 'Database Operations', 'Security & Compliance'];

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ padding: '32px', color: 'var(--text-primary, #e2e8f0)', fontFamily: 'Space Grotesk, -apple-system, sans-serif' }}>
      {/* Header Banner */}
      <div style={{
        marginBottom: '28px',
        padding: '24px 32px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(14, 116, 144, 0.05) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Mail size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              EvaOps Email Templates & Communication Control
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Inspect, live-preview, and test dispatch autonomous DevOps alerts, CI/CD telemetry, and cloud security emails.
            </p>
          </div>
        </div>
        <button
          onClick={fetchTemplates}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            color: '#22d3ee', fontSize: '13px', fontWeight: '800', cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Templates</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: selectedCategory === cat ? '1px solid #06b6d4' : '1px solid #334155',
                backgroundColor: selectedCategory === cat ? 'rgba(6, 182, 212, 0.2)' : '#1e293b',
                color: selectedCategory === cat ? '#22d3ee' : '#cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search EvaOps templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px',
              border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff',
              fontSize: '12px', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Split-Pane Browser */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', height: '640px' }}>
        {/* Left Master List */}
        <div style={{
          backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px',
          overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading EvaOps templates...</div>
          ) : filteredTemplates.map(tmpl => {
            const isSelected = activeTemplate?.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => loadPreview(tmpl)}
                style={{
                  padding: '14px', borderRadius: '10px',
                  border: isSelected ? '1px solid #06b6d4' : '1px solid #1e293b',
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : '#1e293b',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#22d3ee' : '#f8fafc' }}>
                    {tmpl.name}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                    {tmpl.category}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tmpl.subject}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Detail Preview Pane */}
        <div style={{
          backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px',
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          {activeTemplate ? (
            <>
              <div style={{ padding: '16px 24px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                    {activeTemplate.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Subject: <strong>{activeTemplate.subject}</strong>
                  </span>
                </div>
                <button
                  onClick={() => { setTestRecipient(''); setTestModalOpen(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px',
                    backgroundColor: '#06b6d4', color: '#ffffff', border: 'none',
                    fontSize: '12px', fontWeight: '800', cursor: 'pointer'
                  }}
                >
                  <Send size={14} />
                  <span>Send Test Email</span>
                </button>
              </div>

              <div style={{ flex: 1, backgroundColor: '#0b0f19', padding: '16px' }}>
                {loadingHtml ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '13px' }}>
                    Rendering live HTML preview...
                  </div>
                ) : (
                  <iframe
                    title="Template HTML Live Preview"
                    srcDoc={compiledHtml}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', backgroundColor: '#0b0f19' }}
                  />
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '13px' }}>
              Select an EvaOps template from the left catalog.
            </div>
          )}
        </div>
      </div>

      {/* Test Email Dispatch Modal */}
      {testModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(7, 10, 19, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            width: '420px', backgroundColor: '#0f172a', border: '1px solid #06b6d4',
            borderRadius: '16px', padding: '28px', color: '#ffffff'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', margin: '0 0 8px 0' }}>
              Dispatch Test Email
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Send test sample email for <strong>{activeTemplate?.name}</strong> using configured SMTP gateway.
            </p>

            {testStatus && (
              <div style={{
                padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700',
                backgroundColor: testStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: testStatus.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
                color: testStatus.type === 'success' ? '#10b981' : '#ef4444'
              }}>
                {testStatus.text}
              </div>
            )}

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#cbd5e1', marginBottom: '6px' }}>
              Recipient Email Address:
            </label>
            <input
              type="email"
              placeholder="e.g. devops-lead@company.com"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff',
                fontSize: '13px', outline: 'none', marginBottom: '24px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setTestModalOpen(false)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155',
                  backgroundColor: '#1e293b', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={sendingTest || !testRecipient}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  backgroundColor: '#06b6d4', color: '#ffffff', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                  opacity: sendingTest || !testRecipient ? 0.6 : 1
                }}
              >
                {sendingTest ? 'Sending...' : 'Dispatch Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
