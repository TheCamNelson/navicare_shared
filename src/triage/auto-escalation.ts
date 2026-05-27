import { ComplaintCode } from "../types/complaint.js";
import type { Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import { CTASLevel } from "../types/triage.js";

const includes = (val: unknown, item: string): boolean => {
  if (Array.isArray(val)) return val.includes(item);
  return val === item;
};

const isYes = (v: unknown): boolean => v === "Yes" || v === true;

/**
 * VTriage high-risk auto-escalation rules — patterns that auto-escalate to minimum CTAS 2.
 * Per techspec.txt §5.6, 7 explicit patterns are codified.
 */
export function applyAutoEscalationRules(
  currentCTAS: CTASLevel,
  encounter: Encounter,
  intake: IntakeData,
): CTASLevel {
  const r = intake.complaint_responses;
  const code = encounter.complaint_code;

  const rules: boolean[] = [
    // 1. Extreme pain (>=10) in chest/abdominal/headache
    intake.pain_level >= 10 &&
      (code === ComplaintCode.CHEST_PAIN ||
        code === ComplaintCode.ABDOMINAL ||
        code === ComplaintCode.HEADACHE),

    // 2. Chest pain + pressure-squeezing
    code === ComplaintCode.CHEST_PAIN &&
      r["pain_character"] === "Pressure-squeezing",

    // 3. Headache + worst-of-life
    code === ComplaintCode.HEADACHE && r["severity"] === "Worst of my life",

    // 4. Allergic + throat swelling
    code === ComplaintCode.ALLERGIC && includes(r["swelling_location"], "Throat"),

    // 5. Mental health + suicidal thoughts
    code === ComplaintCode.MENTAL_HEALTH && isYes(r["thoughts_self_harm"]),

    // 6. Neonatal fever
    encounter.is_pediatric_flag &&
      typeof r["temperature"] === "number" &&
      (r["temperature"] as number) >= 38.0 &&
      typeof r["child_age_months"] === "number" &&
      (r["child_age_months"] as number) < 3,

    // 7. Sudden testicular pain
    code === ComplaintCode.URINARY_REPRO &&
      r["concern_type"] === "Testicular pain" &&
      isYes(r["sudden_onset"]),
  ];

  for (const rule of rules) {
    if (rule) {
      return Math.min(currentCTAS, 2) as CTASLevel;
    }
  }

  return currentCTAS;
}
