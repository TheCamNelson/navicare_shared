import type { CTASLevel } from "./triage.js";

export enum QueueFlag {
  MENTAL_HEALTH_SI = "MENTAL_HEALTH_SI",
  PEDIATRIC_UNDER_2 = "PEDIATRIC_UNDER_2",
  PREGNANCY = "PREGNANCY",
  REPEAT_VISIT = "REPEAT_VISIT",
  ELDERLY_80_PLUS = "ELDERLY_80_PLUS",
}

export type QueueStatus = "WAITING" | "ASSIGNED" | "COMPLETED" | "ABANDONED" | "ESCALATED";

export interface QueueEntry {
  id: string;
  encounter_id: string;
  ctas_level: CTASLevel;
  priority_score: number;
  special_flags: QueueFlag[];
  clinician_type_required?: "MH" | "PEDS" | "GENERAL";
  assigned_clinician_id?: string;
  entered_queue_at: Date;
  assigned_at?: Date;
  status: QueueStatus;
}

export interface Message {
  id: string;
  encounter_id: string;
  sender: "PATIENT" | "BOT" | "CLINICIAN" | "SYSTEM";
  sender_id?: string;
  text: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}
