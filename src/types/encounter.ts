export enum EncounterState {
  CREATED = "CREATED",
  IDENTITY_VERIFIED = "IDENTITY_VERIFIED",
  REJECTED = "REJECTED",
  INTAKE_IN_PROGRESS = "INTAKE_IN_PROGRESS",
  INTAKE_COMPLETE = "INTAKE_COMPLETE",
  TRIAGE_PROCESSING = "TRIAGE_PROCESSING",
  TRIAGE_COMPLETE = "TRIAGE_COMPLETE",
  TRIAGE_ERROR = "TRIAGE_ERROR",
  ED_DIRECT = "ED_DIRECT",
  IN_QUEUE = "IN_QUEUE",
  ESCALATED = "ESCALATED",
  CLINICIAN_ASSIGNED = "CLINICIAN_ASSIGNED",
  CLINICIAN_REVIEW = "CLINICIAN_REVIEW",
  PATHWAY_ASSIGNED = "PATHWAY_ASSIGNED",
  HOME_CARE_IN_PROGRESS = "HOME_CARE_IN_PROGRESS",
  URGENT_CARE_IN_PROGRESS = "URGENT_CARE_IN_PROGRESS",
  ED_IN_PROGRESS = "ED_IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

import type { ComplaintCode } from "./complaint.js";

export interface Encounter {
  id: string;
  patient_id: string;
  state: EncounterState;
  complaint_code?: ComplaintCode;
  is_pediatric_flag: boolean;
  is_repeat_visit: boolean;
  previous_encounter_id?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  abandoned_at?: Date;
}
