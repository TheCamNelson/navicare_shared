export type ComplaintResponses = Record<string, unknown>;

export interface BaselineResponses {
  onset: string;            // "< 1 hour" | "1-6 hours" | "6-24 hours" | "1-3 days" | "3-7 days" | "> 1 week"
  pain_level: number;       // 1-10
  trajectory: string;       // "Better" | "Same" | "Worse"
  comorbidities: string[];  // multi-select
  current_medications: string;
  recent_visit: boolean;
  drug_allergies: string;
}

export interface IntakeData extends BaselineResponses {
  id: string;
  encounter_id: string;
  complaint_responses: ComplaintResponses;
  created_at: Date;
}
