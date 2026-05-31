// Midtrans Snap API Helper
// Documentation: https://docs.midtrans.com/reference/snap-api

import { createHash } from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const PAYMENT_DEMO_MODE = process.env.PAYMENT_DEMO_MODE === "true";

const SNAP_API_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const SNAP_SCRIPT_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

const STATUS_API_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com/v2"
  : "https://api.sandbox.midtrans.com/v2";

export interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface MidtransItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransCustomerDetails {
  first_name: string;
  email: string;
  phone?: string;
}

export interface MidtransSnapRequest {
  transaction_details: MidtransTransactionDetails;
  item_details: MidtransItemDetails[];
  customer_details: MidtransCustomerDetails;
  enabled_payments?: string[];
  callbacks?: {
    finish?: string;
    error?: string;
  };
}

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransTransactionStatusResponse {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string;
  status_code?: string;
  transaction_id?: string;
}

/**
 * Create Snap transaction token
 */
export async function createSnapTransaction(
  request: MidtransSnapRequest
): Promise<MidtransSnapResponse> {
  // Demo mode: return mock token
  if (PAYMENT_DEMO_MODE) {
    return {
      token: `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      redirect_url: `/payment/demo?order_id=${request.transaction_details.order_id}`,
    };
  }

  const authString = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");

  const response = await fetch(SNAP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Midtrans API error: ${error.error_messages?.join(", ") || "Unknown error"}`
    );
  }

  return response.json();
}

/**
 * Get Midtrans configuration for client-side
 */
export function getMidtransConfig() {
  return {
    clientKey: MIDTRANS_CLIENT_KEY,
    snapScriptUrl: SNAP_SCRIPT_URL,
    isProduction: MIDTRANS_IS_PRODUCTION,
    demoMode: PAYMENT_DEMO_MODE,
  };
}

/**
 * Fetch transaction status from Midtrans Status API.
 */
export async function getTransactionStatus(
  orderId: string,
): Promise<MidtransTransactionStatusResponse> {
  if (PAYMENT_DEMO_MODE) {
    return {
      order_id: orderId,
      transaction_status: "settlement",
      payment_type: "demo",
      status_code: "200",
    };
  }

  const authString = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");
  const response = await fetch(
    `${STATUS_API_BASE_URL}/${encodeURIComponent(orderId)}/status`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Midtrans status error: ${error.status_message ?? response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Verify notification signature from Midtrans webhook
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const hash = createHash("sha512")
    .update(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY)
    .digest("hex");
  return hash === signatureKey;
}

/**
 * Map Midtrans transaction status to our order status
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): "pending" | "paid" | "failed" | "expired" {
  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") {
      return "paid";
    }
    return "pending";
  }

  if (transactionStatus === "settlement") {
    return "paid";
  }

  if (
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    transactionStatus === "expire"
  ) {
    return "failed";
  }

  if (transactionStatus === "pending") {
    return "pending";
  }

  return "pending";
}
