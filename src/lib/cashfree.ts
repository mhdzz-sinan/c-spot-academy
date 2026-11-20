// ============================================================================
// C-Spot Academy — Cashfree Payment Gateway Server Integration
// Supports Sandbox & Production PG APIs + HMAC-SHA256 Webhook Verification
// File: src/lib/cashfree.ts
// ============================================================================

import crypto from 'crypto';

export type CashfreeEnvironment = 'sandbox' | 'production';

export function getCashfreeConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID || '';
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET || '';
  const env: CashfreeEnvironment =
    process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';

  const baseUrl =
    env === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

  const isConfigured =
    Boolean(clientId) &&
    Boolean(clientSecret) &&
    !clientId.includes('your_cashfree_client_id') &&
    !clientSecret.includes('your_cashfree_client_secret');

  return {
    clientId,
    clientSecret,
    env,
    apiVersion,
    baseUrl,
    isConfigured,
  };
}

export interface CreateCashfreeOrderInput {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
  orderNote?: string;
}

export interface CashfreeOrderResult {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_expiry_time?: string;
  isSimulated?: boolean;
}

export async function createCashfreeOrder(
  input: CreateCashfreeOrderInput
): Promise<CashfreeOrderResult> {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    if (config.env === 'production') {
      throw new Error('Cashfree production credentials are not configured.');
    }

    return {
      cf_order_id: `cf_sim_${Date.now()}`,
      order_id: input.orderId,
      order_status: 'ACTIVE',
      payment_session_id: `session_sim_${crypto.randomBytes(16).toString('hex')}`,
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      isSimulated: true,
    };
  }

  const response = await fetch(`${config.baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': config.apiVersion,
      'x-client-id': config.clientId,
      'x-client-secret': config.clientSecret,
    },
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.orderAmount,
      order_currency: input.orderCurrency || 'INR',
      customer_details: {
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
      },
      order_meta: {
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
      },
      order_note: input.orderNote || 'C-Spot Academy Workshop Enrollment',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.message || `Cashfree order creation failed (${response.status})`;
    throw new Error(message);
  }

  return {
    cf_order_id: String(data.cf_order_id),
    order_id: String(data.order_id),
    order_status: String(data.order_status),
    payment_session_id: String(data.payment_session_id),
    order_expiry_time: data.order_expiry_time,
    isSimulated: false,
  };
}

export interface CashfreeOrderVerificationResult {
  order_id: string;
  order_status: 'PAID' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | string;
  order_amount: number;
  order_currency: string;
  cf_payment_id?: string;
  payment_method?: string;
  bank_reference?: string;
  payment_time?: string;
  raw: Record<string, unknown>;
}

export async function fetchCashfreeOrderStatus(
  orderId: string
): Promise<CashfreeOrderVerificationResult> {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    return {
      order_id: orderId,
      order_status: 'PAID',
      order_amount: 0,
      order_currency: 'INR',
      cf_payment_id: `pay_sim_${orderId}`,
      payment_method: 'UPI_SANDBOX_SIM',
      bank_reference: `UTR${Date.now()}`,
      payment_time: new Date().toISOString(),
      raw: { simulated: true, order_id: orderId },
    };
  }

  const orderRes = await fetch(
    `${config.baseUrl}/orders/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      headers: {
        'x-api-version': config.apiVersion,
        'x-client-id': config.clientId,
        'x-client-secret': config.clientSecret,
      },
      cache: 'no-store',
    }
  );

  const orderData = await orderRes.json();

  if (!orderRes.ok) {
    throw new Error(
      orderData?.message || `Failed to verify order with Cashfree (${orderRes.status})`
    );
  }

  let cfPaymentId: string | undefined;
  let paymentMethod: string | undefined;
  let bankReference: string | undefined;
  let paymentTime: string | undefined;

  if (orderData.order_status === 'PAID') {
    const paymentsRes = await fetch(
      `${config.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`,
      {
        method: 'GET',
        headers: {
          'x-api-version': config.apiVersion,
          'x-client-id': config.clientId,
          'x-client-secret': config.clientSecret,
        },
        cache: 'no-store',
      }
    );

    if (paymentsRes.ok) {
      const payments = await paymentsRes.json();
      if (Array.isArray(payments)) {
        const successTxn = payments.find(
          (p) => p.payment_status === 'SUCCESS'
        );
        if (successTxn) {
          cfPaymentId = String(successTxn.cf_payment_id);
          paymentMethod = successTxn.payment_group || 'ONLINE';
          bankReference = successTxn.bank_reference || undefined;
          paymentTime = successTxn.payment_time || undefined;
        }
      }
    }
  }

  return {
    order_id: String(orderData.order_id),
    order_status: String(orderData.order_status),
    order_amount: Number(orderData.order_amount),
    order_currency: String(orderData.order_currency || 'INR'),
    cf_payment_id: cfPaymentId || `cf_verified_${orderId}`,
    payment_method: paymentMethod,
    bank_reference: bankReference,
    payment_time: paymentTime,
    raw: orderData,
  };
}

export function verifyCashfreeWebhookSignature(params: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
  secretOverride?: string;
}): boolean {
  const { rawBody, timestamp, signature, secretOverride } = params;
  if (!rawBody || !timestamp || !signature) {
    return false;
  }

  const secret = secretOverride || process.env.CASHFREE_CLIENT_SECRET || '';
  if (!secret) {
    return false;
  }

  const signedPayload = `${timestamp}${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('base64');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const receivedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
