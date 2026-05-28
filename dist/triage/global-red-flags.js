import { ComplaintCode } from "../types/complaint.js";
/**
 * Check the 14 global red flags from clinical.txt §6 / techspec.txt §5.2.
 * Returns ALL triggered flags. If any are triggered the patient is CTAS 1 / ED_DIRECT.
 */
export function checkGlobalRedFlags(intake, encounter, _patient) {
    const r = intake.complaint_responses;
    const triggered = [];
    const includes = (val, item) => {
        if (Array.isArray(val))
            return val.includes(item);
        return val === item;
    };
    // 1. Unresponsive
    if (r["consciousness"] === "Unresponsive") {
        triggered.push({
            name: "unresponsive",
            instructions: "Call 911 immediately. Do not move the patient.",
        });
    }
    // 2. Not breathing / severe respiratory distress + cyanosis
    const severeBreathing = r["breathing_severity"] === "Severe (single words only)" ||
        r["breathing_severity"] === "Can barely breathe";
    if (severeBreathing && r["cyanosis"] === "Yes") {
        triggered.push({
            name: "not_breathing",
            instructions: "Call 911 immediately.",
        });
    }
    // Also a stand-alone "can barely breathe" should escalate to ED_DIRECT per clinical §5.5
    if (r["breathing_severity"] === "Can barely breathe") {
        triggered.push({
            name: "respiratory_failure",
            instructions: "Call 911 immediately.",
        });
    }
    // 3. Active suicidal plan
    if (encounter.complaint_code === ComplaintCode.MENTAL_HEALTH &&
        (r["plan_to_harm"] === "Yes" || r["plan_to_harm"] === true)) {
        triggered.push({
            name: "active_suicidal_plan",
            instructions: "If you are in immediate danger, call 911. Talk Suicide Canada: 988 (call or text). Go to your nearest emergency department.",
        });
    }
    // 4. Homicidal ideation
    if (encounter.complaint_code === ComplaintCode.MENTAL_HEALTH &&
        (r["thoughts_harm_others"] === "Yes" || r["thoughts_harm_others"] === true)) {
        triggered.push({
            name: "homicidal_ideation",
            instructions: "Call 911 immediately.",
        });
    }
    // 5. Chemical eye exposure
    if (r["chemical_exposure"] === "Yes" || r["chemical_exposure"] === true) {
        triggered.push({
            name: "chemical_eye_exposure",
            instructions: "Flush your eye with clean water continuously until you reach the ED.",
        });
    }
    // 6. Airway compromise (cannot swallow + drooling)
    if (r["can_swallow"] === "Cannot swallow at all" &&
        (r["drooling"] === "Yes" || r["drooling"] === true)) {
        triggered.push({
            name: "airway_compromise",
            instructions: "Call 911 immediately. Do not eat or drink.",
        });
    }
    // 7. Active severe hemorrhage
    if (r["active_bleeding"] === "Severe (won't stop)" ||
        r["bleeding_controlled"] === "No") {
        triggered.push({
            name: "severe_hemorrhage",
            instructions: "Apply firm pressure. Call 911.",
        });
    }
    // 8. Anaphylaxis (tongue/throat swelling + breathing trouble)
    const swelling = r["swelling_location"];
    const tongueOrThroat = includes(swelling, "Tongue") || includes(swelling, "Throat");
    if (tongueOrThroat &&
        (r["breathing_trouble"] === "Yes" || r["breathing_trouble"] === true)) {
        triggered.push({
            name: "anaphylaxis",
            instructions: "Use EpiPen if available. Call 911 immediately.",
        });
    }
    // 9. Suspected stroke
    if ((r["weakness_one_side"] === "Yes" || r["weakness_one_side"] === true) &&
        (r["speech_difficulty"] === "Yes" || r["speech_difficulty"] === true)) {
        triggered.push({
            name: "suspected_stroke",
            instructions: "Call 911. Note the time symptoms started. Do not drive.",
        });
    }
    // 10. Neonatal fever (< 3 months + temp >= 38.0)
    const childAgeMonths = computeChildAgeMonths(r);
    const temp = typeof r["temperature"] === "number" ? r["temperature"] : null;
    if (encounter.is_pediatric_flag &&
        childAgeMonths !== null &&
        childAgeMonths < 3 &&
        temp !== null &&
        temp >= 38.0) {
        triggered.push({
            name: "neonatal_fever",
            instructions: "Take your baby to the nearest ED immediately.",
        });
    }
    // 11. Meningococcal rash
    const hasFever = r["fever"] === "Yes" || r["fever"] === true || (temp !== null && temp >= 38.0);
    if (encounter.is_pediatric_flag &&
        r["rash_type"] === "Yes, non-blanching (doesn't fade)" &&
        hasFever) {
        triggered.push({
            name: "meningococcal_rash",
            instructions: "This could be serious. Go to the nearest ED immediately.",
        });
    }
    // 12. Late pregnancy bleeding
    const weeks = typeof r["weeks_pregnant"] === "number" ? r["weeks_pregnant"] : 0;
    if (r["pregnant"] === "Yes" &&
        weeks > 20 &&
        r["bleeding_severity"] === "Heavy (soaking pad per hour)") {
        triggered.push({
            name: "late_pregnancy_bleeding",
            instructions: "Call 911 immediately. Lie on your left side.",
        });
    }
    // 13. Testicular torsion
    if (r["concern_type"] === "Testicular pain" &&
        (r["sudden_onset"] === "Yes" || r["sudden_onset"] === true)) {
        triggered.push({
            name: "testicular_torsion",
            instructions: "Go to the nearest ED immediately. This is time-sensitive.",
        });
    }
    // 14. Cauda equina (back pain + bladder/bowel)
    if (encounter.complaint_code === ComplaintCode.BACK_JOINT &&
        (r["bladder_bowel"] === "Yes" || r["bladder_bowel"] === true)) {
        triggered.push({
            name: "cauda_equina",
            instructions: "Go to the nearest ED immediately. This may require urgent surgery.",
        });
    }
    return triggered;
}
function computeChildAgeMonths(r) {
    if (typeof r["child_age_months"] === "number") {
        return r["child_age_months"];
    }
    if (typeof r["child_age_years"] === "number") {
        return r["child_age_years"] * 12;
    }
    return null;
}
//# sourceMappingURL=global-red-flags.js.map