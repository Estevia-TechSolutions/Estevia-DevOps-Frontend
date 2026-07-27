/**
 * EvaPay Service Helper for Dynamic Environment-Aware Payment Delegation
 * Resolves matching EvaPay domain and API base URL dynamically without hardcoded localhost fallbacks.
 */

export const getApiBaseUrl = (): string => {
  let url = (import.meta.env.VITE_API_URL as string) || '';

  if (!url && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('dev-') || host.includes('-dev')) {
      url = 'https://api-dev.esteviatech.com/api';
    } else if (host.includes('qa-') || host.includes('-qa')) {
      url = 'https://api-qa.esteviatech.com/api';
    } else if (host.includes('esteviatech.com')) {
      url = 'https://api.esteviatech.com/api';
    }
  }

  if (!url) {
    const env = (import.meta.env.VITE_APP_ENV || 'development').toLowerCase();
    if (env === 'production' || env === 'prod') {
      url = 'https://api.esteviatech.com/api';
    } else if (env === 'qa' || env === 'staging') {
      url = 'https://api-qa.esteviatech.com/api';
    } else {
      url = 'https://api-dev.esteviatech.com/api';
    }
  }

  url = url.replace(/\/$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

export const getEvaPayGatewayUrl = (): string => {
  if (import.meta.env.VITE_EVAPAY_URL) {
    return import.meta.env.VITE_EVAPAY_URL as string;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('dev-') || host.includes('-dev')) {
      return 'https://dev-evapay.esteviatech.com';
    }
    if (host.includes('qa-') || host.includes('-qa')) {
      return 'https://qa-evapay.esteviatech.com';
    }
    if (host.includes('esteviatech.com')) {
      return 'https://evapay.esteviatech.com';
    }
  }

  const env = (import.meta.env.VITE_APP_ENV || 'development').toLowerCase();
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
  const apiBase = getApiBaseUrl();
  
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
