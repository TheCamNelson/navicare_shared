import { ComplaintCode } from "../types/complaint.js";
import type { IntakeData } from "../types/intake.js";
import { CTASLevel, type ModifierEntry } from "../types/triage.js";

const ONSET_CTAS_MAP: Record<string, CTASLevel> = {
  "< 1 hour": CTASLevel.LEVEL_3,
  "1-6 hours": CTASLevel.LEVEL_3,
  "6-24 hours": CTASLevel.LEVEL_4,
  "1-3 days": CTASLevel.LEVEL_4,
  "3-7 days": CTASLevel.LEVEL_5,
  "> 1 week": CTASLevel.LEVEL_5,
};

const TRAJECTORY_CTAS_MAP: Record<string, CTASLevel> = {
  Worse: CTASLevel.LEVEL_3,
  Same: CTASLevel.LEVEL_4,
  Better: CTASLevel.LEVEL_5,
};

const HIGH_RISK_COMPLAINTS: ComplaintCode[] = [
  ComplaintCode.CHEST_PAIN,
  ComplaintCode.ABDOMINAL,
  ComplaintCode.HEADACHE,
  ComplaintCode.BREATHING,
];

export function mapPainToCTAS(
  painLevel: number,
  complaint: ComplaintCode,
): CTASLevel {
  if (HIGH_RISK_COMPLAINTS.includes(complaint)) {
    if (painLevel >= 9) return CTASLevel.LEVEL_2;
    if (painLevel >= 7) return CTASLevel.LEVEL_3;
    if (painLevel >= 4) return CTASLevel.LEVEL_4;
    return CTASLevel.LEVEL_5;
  }
  if (painLevel >= 9) return CTASLevel.LEVEL_3;
  if (painLevel >= 7) return CTASLevel.LEVEL_4;
  return CTASLevel.LEVEL_5;
}

function assessBleedingCTAS(intake: IntakeData): CTASLevel {
  const r = intake.complaint_responses;
  const bleeding = r["active_bleeding"];
  if (bleeding === "Severe (won't stop)") return CTASLevel.LEVEL_1;
  if (bleeding === "Moderate") return CTASLevel.LEVEL_3;
  if (bleeding === "Minor") return CTASLevel.LEVEL_4;
  if (r["bleeding_controlled"] === "No") return CTASLevel.LEVEL_2;
  if (r["bleeding_severity"] === "Heavy (soaking pad per hour)")
    return CTASLevel.LEVEL_2;
  if (r["bleeding_severity"] === "Moderate") return CTASLevel.LEVEL_3;
  if (r["bleeding_severity"] === "Spotting") return CTASLevel.LEVEL_4;
  return CTASLevel.LEVEL_4;
}

function hasBleedingIndicators(intake: IntakeData): boolean {
  const r = intake.complaint_responses;
  return (
    typeof r["active_bleeding"] !== "undefined" &&
    r["active_bleeding"] !== "No" ||
    r["bleeding_controlled"] === "No" ||
    (typeof r["bleeding_severity"] === "string" &&
      r["bleeding_severity"] !== "None")
  );
}

function assessMOI(intake: IntakeData): CTASLevel {
  const r = intake.complaint_responses;
  const type = r["injury_type"];
  if (type === "Motor vehicle accident" || type === "Assault") {
    return CTASLevel.LEVEL_3;
  }
  if (type === "Fall" || type === "Sports" || type === "Work injury") {
    return CTASLevel.LEVEL_4;
  }
  return CTASLevel.LEVEL_5;
}

export function evaluateFirstOrderModifiers(
  complaint: ComplaintCode,
  intake: IntakeData,
): ModifierEntry[] {
  const modifiers: ModifierEntry[] = [];

  // Pain severity
  const painCTAS = mapPainToCTAS(intake.pain_level, complaint);
  modifiers.push({
    name: "pain_severity",
    value: intake.pain_level,
    ctas_impact: painCTAS,
  });

  // Onset acuity
  const onsetCTAS = ONSET_CTAS_MAP[intake.onset] ?? CTASLevel.LEVEL_5;
  modifiers.push({
    name: "onset_acuity",
    value: intake.onset,
    ctas_impact: onsetCTAS,
  });

  // Trajectory
  const trajCTAS = TRAJECTORY_CTAS_MAP[intake.trajectory] ?? CTASLevel.LEVEL_5;
  modifiers.push({
    name: "trajectory",
    value: intake.trajectory,
    ctas_impact: trajCTAS,
  });

  // Bleeding risk
  if (hasBleedingIndicators(intake)) {
    modifiers.push({
      name: "bleeding_risk",
      value: "present",
      ctas_impact: assessBleedingCTAS(intake),
    });
  }

  // Mechanism of injury (for INJURY only)
  if (complaint === ComplaintCode.INJURY) {
    const injType = intake.complaint_responses["injury_type"];
    modifiers.push({
      name: "mechanism_of_injury",
      value: typeof injType === "string" ? injType : "unknown",
      ctas_impact: assessMOI(intake),
    });
  }

  return modifiers;
}
