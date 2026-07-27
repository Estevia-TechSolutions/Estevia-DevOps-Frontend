import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getApiBaseUrl, getEvaPayGatewayUrl } from '../../services/evaPayService';

interface EvaPayModalProps {
  invoiceId: string;
  amount: number;
  currency?: string;
  appId?: string;
  orgId?: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}

export const EvaPayModal: React.FC<EvaPayModalProps> = ({
  invoiceId,
  amount,
  currency = 'INR',
  appId = 'EvaOps',
  orgId,
  customerName = 'Estevia Client',
  customerEmail = 'admin@esteviatech.com',
  onSuccess,
  onClose
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{ token: string; orderId: string; mode?: string; exchangeRate?: number; upi?: { is_active: boolean; vpa: string; merchant_name: string; mcc: string } } | null>(null);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [txId, setTxId] = useState<string>('');

  // 1. Detect current theme on mount
  useEffect(() => {
    const checkTheme = () => {
      const stored = localStorage.getItem('theme') || localStorage.getItem('hub-theme') || 'dark';
      const hasDarkClass = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      setTheme(stored === 'dark' || hasDarkClass ? 'dark' : 'light');
    };
    checkTheme();
  }, []);

  // 2. Initialize EvaPay Order via backend
  useEffect(() => {
    let active = true;
    const initOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiBase = getApiBaseUrl();
        const res = await window.fetch(`${apiBase}/evapay/order/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_id: appId,
            org_id: orgId || null,
            invoice_id: invoiceId,
            source_app: appId,
            amount: amount,
            currency: currency,
            customer_name: customerName,
            customer_email: customerEmail
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to create payment transaction.');
        }

        const data = await res.json();
        if (active) {
          if (data && data.success) {
            setOrderData({
              token: data.transaction_id,
              orderId: data.merchant_order_id,
              mode: data.gateway_config?.mode,
              exchangeRate: data.exchange_rate,
              upi: data.gateway_config?.upi
            });
          } else {
            throw new Error(data.message || 'Failed to create payment transaction.');
          }
        }
      } catch (err: any) {
        if (active) {
          console.error('[EvaPayModal] Order initialization failed:', err);
          setError(err.message || 'Payment initialization error.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initOrder();
    return () => {
      active = false;
    };
  }, [invoiceId, amount, currency, appId, orgId, customerName, customerEmail]);

  // 3. Listen to window messages from the EvaPay checkout iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const { data } = event;
      if (!data || data.type !== 'EVAPAY_SUCCESS') return;

      const { orderId, transactionId } = data;
      if (orderId && orderId === orderData?.orderId) {
        console.log('[EvaPayModal] Received SUCCESS postMessage from checkout:', transactionId);
        setTxId(transactionId);
        setPaymentFinished(true);

        // Parent component's onSuccess handles refreshing the invoice status via API
        setTimeout(() => {
          onSuccess(transactionId);
        }, 2000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [orderData, invoiceId, onSuccess]);

  // 4. Fallback status verification poller
  const handleVerifyStatusFallback = async () => {
    if (!orderData) return;
    try {
      setLoading(true);
      const apiBase = getApiBaseUrl();
      const res = await window.fetch(`${apiBase}/evapay/transaction/status?orderId=${orderData.orderId}`);
      if (!res.ok) {
        throw new Error('Status verification request failed.');
      }
      const data = await res.json();
      if (data?.success && data.transaction?.status === 'SUCCESS') {
        const transactionId = data.transaction.id;
        setTxId(transactionId);
        setPaymentFinished(true);
        setTimeout(() => onSuccess(transactionId), 1500);
      } else {
        alert('Transaction is still processing. Please complete the payment steps inside checkout.');
      }
    } catch (verifyErr: any) {
      alert(verifyErr.message || 'Error checking payment status.');
    } finally {
      setLoading(false);
    }
  };

  // Compile iframe checkout URL
  const gatewayUrl = getEvaPayGatewayUrl();
  const iframeSrc = orderData
    ? `${gatewayUrl}?token=${orderData.token}&orderId=${orderData.orderId}&amount=${amount}&currency=${currency}&mode=${orderData.mode || ''}&exchangeRate=${orderData.exchangeRate || ''}&invoice_id=${invoiceId}&customerName=${encodeURIComponent(customerName)}&customerEmail=${encodeURIComponent(customerEmail)}&theme=${theme}&upi_vpa=${encodeURIComponent(orderData.upi?.vpa || '')}&upi_name=${encodeURIComponent(orderData.upi?.merchant_name || '')}&upi_mcc=${orderData.upi?.mcc || ''}&embedded=true`
    : '';

  const modalContent = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: 'rgba(5, 8, 28, 0.75)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: '750px', height: '620px',
        borderRadius: '24px', overflow: 'hidden',
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        border: `1.5px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header bar */}
        <div style={{
          padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          background: theme === 'dark' ? '#0a0f1d' : '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <CreditCard size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: theme === 'dark' ? '#f8fafc' : '#0f172a', display: 'block' }}>
                EvaPay Central Clearing
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>
                Secure Payment Checkout · SBIePay Aggregator
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent',
              color: '#94a3b8', cursor: 'pointer', display: 'flex', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Inner Content Area */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, background: theme === 'dark' ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '3px solid #10b981', borderTopColor: 'transparent',
                animation: 'hubSpinCW 0.6s linear infinite'
              }} />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Synchronizing Gateway Handshake...</span>
            </div>
          )}

          {error && (
            <div style={{
              padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '16px', height: '100%', textAlign: 'center', color: '#ef4444'
            }}>
              <AlertCircle size={48} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Payment Initialization Failed</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', maxWidth: '400px' }}>{error}</p>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#ef4444',
                  color: '#ffffff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                Close Window
              </button>
            </div>
          )}

          {paymentFinished && (
            <div style={{
              position: 'absolute', inset: 0, background: theme === 'dark' ? '#0f172a' : '#ffffff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', background: '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>Payment Authenticated!</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                Invoice marked paid successfully.<br />Settlement ID: <strong>{txId}</strong>
              </p>
            </div>
          )}

          {orderData && !error && !paymentFinished && (
            <iframe
              src={iframeSrc}
              title="EvaPay Payment Gateway"
              style={{
                width: '100%', height: '100%', border: 'none', background: 'transparent'
              }}
              onLoad={() => setLoading(false)}
            />
          )}
        </div>

        {/* Footer controls (Only shown during checkout as safety verification fallback) */}
        {orderData && !paymentFinished && !error && (
          <div style={{
            padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            background: theme === 'dark' ? '#0a0f1d' : '#f8fafc', fontSize: '0.72rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
              <ShieldCheck size={16} /> 256-Bit SSL SBIePay Security
            </div>
            <button
              onClick={handleVerifyStatusFallback}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                background: 'transparent', color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Verify Payment Status
            </button>
          </div>
        )}
      </div>

      {/* Embedded CSS animation helpers for loader */}
      <style>{`
        @keyframes hubSpinCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
