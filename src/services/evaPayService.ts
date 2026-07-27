/**
 * EvaPay Service Helper for Dynamic Environment-Aware Payment Delegation
 * Resolves the matching EvaPay domain based on active environment (dev, qa, production).
 */

const getActiveAppEnv = (): string => {
  return (import.meta.env.VITE_APP_ENV || 'development').toLowerCase();
};

export const getEvaPayGatewayUrl = (): string => {
  if (import.meta.env.VITE_EVAPAY_URL) {
    return import.meta.env.VITE_EVAPAY_URL as string;
  }

  const env = getActiveAppEnv();
  if (env === 'production' || env === 'prod') {
    return 'https://evapay.esteviatech.com';
  }
  if (env === 'qa' || env === 'staging') {
    return 'https://qa-evapay.esteviatech.com';
  }
  return 'https://dev-evapay.esteviatech.com';
};

export interface InitiatePaymentParams {
  app_id: string;
  org_id?: string;
  amount: number;
  currency?: string;
  customer_name?: string;
  customer_email?: string;
  return_url?: string;
}

export const redirectToEvaPayCheckout = async (params: InitiatePaymentParams): Promise<void> => {
  const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5001/api';
  
  try {
    const res = await fetch(`${apiBase}/evapay/order/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to initialize EvaPay order.');
    }

    const evaPayBaseUrl = getEvaPayGatewayUrl();
    const checkoutUrl = `${evaPayBaseUrl}?token=${data.transaction_id}&orderId=${data.merchant_order_id}`;
    window.location.href = checkoutUrl;

  } catch (error: any) {
    console.error('Error redirecting to EvaPay:', error);
    alert(error.message || 'Unable to connect to EvaPay Gateway.');
  }
};
