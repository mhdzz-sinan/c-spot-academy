declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeInstance {
    checkout(options: {
      paymentSessionId: string;
      redirectTarget?: '_self' | '_blank' | '_top' | HTMLElement;
      values?: Record<string, string>;
    }): Promise<{
      error?: { message: string };
      redirect?: boolean;
      paymentDetails?: unknown;
    }>;
  }

  export function load(options: {
    mode: 'sandbox' | 'production';
  }): Promise<CashfreeInstance>;
}
