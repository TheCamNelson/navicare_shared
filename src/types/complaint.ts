import type { Question } from "./question.js";
import type { CTASLevel } from "./triage.js";

export enum ComplaintCode {
  CHEST_PAIN = "CHEST_PAIN",
  ABDOMINAL = "ABDOMINAL",
  HEADACHE = "HEADACHE",
  FEVER = "FEVER",
  BREATHING = "BREATHING",
  INJURY = "INJURY",
  ALLERGIC = "ALLERGIC",
  MENTAL_HEALTH = "MENTAL_HEALTH",
  PEDIATRIC = "PEDIATRIC",
  SKIN_WOUND = "SKIN_WOUND",
  BACK_JOINT = "BACK_JOINT",
  URINARY_REPRO = "URINARY_REPRO",
  EYE_ENT = "EYE_ENT",
  OTHER = "OTHER",
}

export interface ComplaintConfig {
  code: ComplaintCode;
  label: string;
  description: string;
  questions: Question[];
  defaultCTAS: CTASLevel;
}
