import { AgeGroup } from "../types/patient.js";
import { ComplaintCode } from "../types/complaint.js";
const AGE_ESCALATION = {
    [AgeGroup.INFANT]: 1,
    [AgeGroup.TODDLER]: 1,
    [AgeGroup.PEDIATRIC]: 0,
    [AgeGroup.ADULT]: 0,
    [AgeGroup.SENIOR]: 0,
    [AgeGroup.ELDERLY]: 1,
};
const HIGH_RISK_COMORBIDITIES = [
    "Heart Disease",
    "Cancer",
    "Kidney Disease",
    "Immune Disorder",
    "Blood Thinners",
];
function clampCTAS(value) {
    const v = Math.max(1, Math.min(5, value));
    return v;
}
export function applyPopulationModifiers(currentCTAS, intake, encounter, patient) {
    let modified = currentCTAS;
    const applied = [];
    // Age-Based Escalation
    const ageEsc = AGE_ESCALATION[patient.age_group] ?? 0;
    if (ageEsc > 0) {
        const before = modified;
        modified = Math.max(modified - ageEsc, 1);
        if (modified !== before) {
            applied.push({
                name: `age_${patient.age_group}`,
                escalation: before - modified,
            });
        }
    }
    // Elderly senior - lower threshold (apply when CTAS >= 4, escalate by 1)
    if (patient.age_group === AgeGroup.SENIOR &&
        encounter.complaint_code === ComplaintCode.CHEST_PAIN) {
        // §8.5: chest pain in elderly auto minimum CTAS 2... but only "elderly" 65+.
        // For senior 65-79, set minimum CTAS 3 for chest pain to model "lower threshold".
        if (modified > 3) {
            const before = modified;
            modified = 3;
            applied.push({
                name: "senior_chest_pain_minimum",
                escalation: before - modified,
            });
        }
    }
    // Comorbidity-Based Escalation
    const matchCount = intake.comorbidities.filter((c) => HIGH_RISK_COMORBIDITIES.includes(c)).length;
    if (matchCount >= 2) {
        const before = modified;
        modified = Math.max(modified - 1, 1);
        if (modified !== before) {
            applied.push({ name: "multiple_comorbidities", escalation: 1 });
        }
    }
    else if (matchCount === 1 && modified >= 4) {
        const before = modified;
        modified = Math.max(modified - 1, 1);
        if (modified !== before) {
            applied.push({ name: "single_comorbidity", escalation: 1 });
        }
    }
    // Pregnancy escalation
    if (intake.comorbidities.includes("Pregnancy")) {
        const before = modified;
        if (encounter.complaint_code === ComplaintCode.ABDOMINAL ||
            encounter.complaint_code === ComplaintCode.URINARY_REPRO) {
            modified = Math.min(modified, 3); // minimum CTAS 3
        }
        else if (modified >= 4) {
            modified = modified - 1;
        }
        if (modified !== before) {
            applied.push({ name: "pregnancy", escalation: before - modified });
        }
    }
    // Repeat Visit
    if (intake.recent_visit) {
        const before = modified;
        modified = Math.max(modified - 1, 1);
        if (modified !== before) {
            applied.push({ name: "repeat_visit", escalation: 1 });
        }
    }
    // Rapidly worsening (worse + onset < 1 hour)
    if (intake.trajectory === "Worse" && intake.onset === "< 1 hour") {
        const before = modified;
        modified = Math.max(modified - 1, 1);
        if (modified !== before) {
            applied.push({ name: "rapidly_worsening", escalation: 1 });
        }
    }
    return { ctas: clampCTAS(modified), modifiers: applied };
}
//# sourceMappingURL=population-modifiers.js.map