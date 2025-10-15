export type Risk = "OK" | "REVIEW" | "LIKELY_FRAUD";

export type Insight = {
  event_id: string;
  risk: Risk;
  score: number;        // 0..1
  explanation: string;  // concise LLM reason
  ts: string;           // ISO string
  user_id?: string;
  amount?: number;
  merchant?: string;
};
