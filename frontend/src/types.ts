export type Risk = "OK" | "REVIEW" | "LIKELY_FRAUD";

export type TransactionStatus = "approved" | "declined" | "pending";

export type AIFlags = {
  mismatch?: boolean;
  expected?: string;
  geo_invalid?: boolean;
  amount_high?: boolean;
  velocity_burst?: boolean;
  high_amount?: boolean;
};

export type Insight = {
  event_id: string;
  risk: Risk;
  score: number;        // 0..1
  explanation: string;  // concise LLM reason
  ts: string;           // ISO string
  transaction_id: string;
  card_id: string;
  customer_id: string;
  merchant_id: string;
  card_number: string;
  merchant_name: string;
  category: string;
  amount: number;
  currency: string;
  city: string;
  state: string;
  zip: string;
  status: TransactionStatus;
  fraud_flag1: boolean;
  fraud_flag2: boolean;
  fraud_flag3: boolean;
  ai_flags?: AIFlags;   // AI-generated fraud detection flags
};
