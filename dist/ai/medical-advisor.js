import { ComplaintCode } from "../types/complaint.js";
/**
 * Returns a deterministic mock "AI medical advisor" opinion based on the
 * triage result. Used by the CRM until a real LLM is wired up.
 */
export function generateAdvisorOpinion(args) {
    const { intake, triage, complaintCode } = args;
    const summaryParts = [
        `Patient age group: ${args.patient.age_group}, CTAS ${triage.final_ctas_level}.`,
        `Pain ${intake.pain_level}/10, onset ${intake.onset}, trajectory ${intake.trajectory}.`,
    ];
    if (triage.global_red_flags_triggered.length > 0) {
        summaryParts.push(`Global red flag(s): ${triage.global_red_flags_triggered.join(", ")}.`);
    }
    if (triage.up_triage_applied) {
        summaryParts.push("Algorithm applied safety up-triage.");
    }
    const ddx = [];
    const workup = [];
    const watch = [];
    switch (complaintCode) {
        case ComplaintCode.CHEST_PAIN:
            ddx.push("ACS", "Aortic dissection", "PE", "Pericarditis", "GERD");
            workup.push("ECG", "Troponin", "Chest X-ray");
            watch.push("Worsening pain", "Diaphoresis", "Syncope");
            break;
        case ComplaintCode.ABDOMINAL:
            ddx.push("Appendicitis", "Cholecystitis", "Bowel obstruction", "Ectopic pregnancy");
            workup.push("CBC", "Lipase", "Pregnancy test", "Abdominal US/CT");
            watch.push("Rigid abdomen", "Fever", "Inability to keep fluids down");
            break;
        case ComplaintCode.HEADACHE:
            ddx.push("Migraine", "Tension headache", "SAH", "Meningitis");
            workup.push("Neuro exam", "Consider CT head");
            watch.push("Worst-ever headache", "Stiff neck", "Focal weakness");
            break;
        case ComplaintCode.MENTAL_HEALTH:
            ddx.push("MDD", "Anxiety disorder", "Acute crisis");
            workup.push("Suicide risk assessment", "Safety planning");
            watch.push("Plan to harm self/others", "Worsening mood");
            break;
        default:
            ddx.push("See clinical assessment");
            workup.push("Full history and physical");
            watch.push("Worsening of any symptom");
    }
    return {
        summary: summaryParts.join(" "),
        differential_diagnoses: ddx,
        recommended_workup: workup,
        red_flags_to_watch: watch,
        generated_at: new Date(),
        source: "MOCK_DETERMINISTIC",
    };
}
//# sourceMappingURL=medical-advisor.js.map