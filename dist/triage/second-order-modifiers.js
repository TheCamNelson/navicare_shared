import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
const includes = (val, item) => {
    if (Array.isArray(val))
        return val.includes(item);
    return val === item;
};
const isYes = (v) => v === "Yes" || v === true;
const evaluators = {
    [ComplaintCode.CHEST_PAIN]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        const pressure = r["pain_character"] === "Pressure-squeezing";
        const cardiacRadiation = includes(r["radiation"], "Left arm") ||
            includes(r["radiation"], "Jaw") ||
            includes(r["radiation"], "Back");
        const cardiacAssoc = includes(r["associated"], "Sweating") ||
            includes(r["associated"], "Nausea-Vomiting");
        if (pressure && cardiacRadiation && cardiacAssoc) {
            mods.push({
                name: "high_suspicion_ACS",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["pain_character"] === "Tearing" &&
            intake.onset === "< 1 hour") {
            mods.push({
                name: "aortic_dissection_concern",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["recent_immobility"]) &&
            intake.onset === "< 1 hour" &&
            isYes(r["shortness_of_breath"])) {
            mods.push({ name: "pe_suspected", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (pressure) {
            mods.push({
                name: "pressure_squeezing_character",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (intake.comorbidities.includes("Heart Disease")) {
            mods.push({
                name: "heart_disease_history",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (isYes(r["shortness_of_breath"])) {
            mods.push({ name: "current_sob", ctas_impact: CTASLevel.LEVEL_3 });
        }
        if (isYes(r["positional"]) && !pressure) {
            mods.push({
                name: "pleuritic_positional",
                ctas_impact: CTASLevel.LEVEL_4,
            });
        }
        return mods;
    },
    [ComplaintCode.ABDOMINAL]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (isYes(r["abdomen_rigid"])) {
            mods.push({ name: "rigid_abdomen", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["vomiting"] === "Yes, with blood") {
            mods.push({ name: "hematemesis", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["pregnancy_possible"] === "Yes" &&
            intake.pain_level >= 7) {
            mods.push({
                name: "possible_ectopic_pregnancy",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["blood_stool"])) {
            mods.push({ name: "gi_bleed", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["location"] === "Lower right" &&
            (r["fever"] === "Yes" || r["fever"] === true)) {
            mods.push({
                name: "appendicitis_suspected",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["eating_status"] === "Unable to keep anything down") {
            mods.push({
                name: "unable_to_keep_down",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (isYes(r["recent_surgery"])) {
            mods.push({
                name: "post_surgical_complication",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (r["fever"] === "Yes") {
            mods.push({ name: "fever_present", ctas_impact: CTASLevel.LEVEL_3 });
        }
        return mods;
    },
    [ComplaintCode.HEADACHE]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (isYes(r["weakness_one_side"]) && isYes(r["speech_difficulty"])) {
            mods.push({ name: "stroke_suspected", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (r["severity"] === "Worst of my life" &&
            r["onset_type"] === "Sudden (seconds-minutes)") {
            // Ambiguous CTAS 1-2 -> choose higher acuity (1)
            mods.push({ name: "sah_suspected", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (isYes(r["stiff_neck"]) && isYes(r["fever"])) {
            mods.push({ name: "meningitis_suspected", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (includes(r["vision_changes"], "Vision loss")) {
            mods.push({ name: "vision_loss", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["seizure"])) {
            mods.push({ name: "seizure", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["head_injury"])) {
            mods.push({ name: "recent_head_injury", ctas_impact: CTASLevel.LEVEL_3 });
        }
        if (r["different_from_usual"] === "Yes") {
            mods.push({
                name: "new_headache_pattern",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (isYes(r["migraine_history"]) &&
            r["different_from_usual"] === "No") {
            mods.push({
                name: "known_migraine_typical",
                ctas_impact: CTASLevel.LEVEL_4,
            });
        }
        return mods;
    },
    [ComplaintCode.FEVER]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (isYes(r["confusion"]) &&
            isYes(r["rigors"]) &&
            typeof r["temperature"] === "number" &&
            r["temperature"] >= 40) {
            mods.push({ name: "sepsis_suspected", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["neck_stiffness"])) {
            mods.push({ name: "meningitis_suspected", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["immunocompromised"])) {
            mods.push({
                name: "febrile_neutropenia_risk",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["cough"] === "With blood") {
            mods.push({ name: "hemoptysis", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["rash"] === "Spreading rapidly") {
            mods.push({
                name: "rapidly_spreading_rash",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (typeof r["temperature"] === "number" && r["temperature"] >= 40) {
            mods.push({
                name: "high_temperature",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (isYes(r["pain_urination"])) {
            mods.push({ name: "uti_symptoms", ctas_impact: CTASLevel.LEVEL_4 });
        }
        return mods;
    },
    [ComplaintCode.BREATHING]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        const severity = r["breathing_severity"];
        if (severity === "Severe (single words only)" ||
            severity === "Can barely breathe" ||
            r["cyanosis"] === "Yes") {
            mods.push({ name: "respiratory_failure", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (r["onset_type"] === "Suddenly (minutes)" &&
            isYes(r["chest_pain"]) &&
            isYes(r["leg_swelling"])) {
            mods.push({ name: "pe_suspected", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["inhaler_response"] === "No improvement") {
            mods.push({
                name: "severe_asthma_copd_exacerbation",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["lie_flat"] === "No" && isYes(r["heart_failure"])) {
            mods.push({
                name: "chf_exacerbation",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["fever_cough"] === "Both") {
            mods.push({
                name: "pneumonia_suspected",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (r["inhaler_response"] === "Helped") {
            mods.push({
                name: "controlled_asthma_exacerbation",
                ctas_impact: CTASLevel.LEVEL_4,
            });
        }
        return mods;
    },
    [ComplaintCode.INJURY]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (includes(r["body_part"], "Neck-Spine") && isYes(r["numbness"])) {
            mods.push({ name: "spinal_injury", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (r["active_bleeding"] === "Severe (won't stop)") {
            mods.push({
                name: "uncontrolled_hemorrhage",
                ctas_impact: CTASLevel.LEVEL_1,
            });
        }
        if (includes(r["body_part"], "Head") && r["loc"] === "Yes") {
            mods.push({ name: "tbi", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["blood_thinners"]) && includes(r["body_part"], "Head")) {
            mods.push({
                name: "blood_thinners_head_injury",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["deformity"]) && r["movement"] === "Cannot move at all") {
            mods.push({
                name: "open_displaced_fracture",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["injury_type"] === "Motor vehicle accident" ||
            r["injury_type"] === "Assault") {
            mods.push({
                name: "high_energy_mechanism",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (isYes(r["deformity"]) || r["movement"] === "Limited") {
            mods.push({
                name: "suspected_closed_fracture",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        return mods;
    },
    [ComplaintCode.ALLERGIC]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        const tongueOrThroat = includes(r["swelling_location"], "Tongue") ||
            includes(r["swelling_location"], "Throat");
        if (tongueOrThroat &&
            isYes(r["breathing_trouble"]) &&
            isYes(r["dizzy_faint"])) {
            mods.push({ name: "anaphylaxis", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (tongueOrThroat) {
            mods.push({
                name: "tongue_throat_swelling",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["epipen"] === "Used it") {
            mods.push({ name: "epipen_used", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["hives"] === "Widespread" &&
            isYes(r["gi_symptoms"]) &&
            r["reaction_trajectory"] === "Worse") {
            mods.push({
                name: "systemic_reaction_worsening",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (r["hives"] === "Widespread" && r["reaction_trajectory"] !== "Worse") {
            mods.push({
                name: "widespread_hives_stable",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (r["hives"] === "Localized" && r["reaction_trajectory"] === "Improving") {
            mods.push({
                name: "localized_improving",
                ctas_impact: CTASLevel.LEVEL_5,
            });
        }
        return mods;
    },
    [ComplaintCode.MENTAL_HEALTH]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (isYes(r["plan_to_harm"])) {
            mods.push({ name: "plan_to_harm", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (isYes(r["thoughts_harm_others"])) {
            mods.push({ name: "homicidal_ideation", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (isYes(r["thoughts_self_harm"]) && !isYes(r["plan_to_harm"])) {
            mods.push({
                name: "suicidal_ideation_no_plan",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["overdose"])) {
            mods.push({ name: "possible_overdose", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["concern_type"] === "Psychosis") {
            mods.push({ name: "psychosis", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["substance_use"])) {
            mods.push({ name: "intoxication", ctas_impact: CTASLevel.LEVEL_3 });
        }
        if (r["daily_activities"] === "Not at all") {
            mods.push({ name: "cannot_function", ctas_impact: CTASLevel.LEVEL_3 });
        }
        if (r["daily_activities"] === "Somewhat") {
            mods.push({ name: "somewhat_impaired", ctas_impact: CTASLevel.LEVEL_4 });
        }
        if (r["feel_safe"] === "No" || r["feel_safe"] === false) {
            mods.push({ name: "does_not_feel_safe", ctas_impact: CTASLevel.LEVEL_3 });
        }
        return mods;
    },
    [ComplaintCode.PEDIATRIC]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (r["consciousness"] === "Unresponsive") {
            mods.push({ name: "unresponsive_child", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (r["consciousness"] === "Difficult to wake") {
            mods.push({ name: "altered_loc", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["seizures"])) {
            mods.push({ name: "pediatric_seizure", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["rash_type"] === "Yes, non-blanching (doesn't fade)") {
            mods.push({
                name: "non_blanching_rash",
                ctas_impact: CTASLevel.LEVEL_1,
            });
        }
        if (r["fontanelle"] === "Yes") {
            mods.push({ name: "bulging_fontanelle", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["feeding"] === "Refusing all fluids") {
            mods.push({ name: "refusing_fluids", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (r["wet_diapers"] === "Very few (0-1)") {
            mods.push({
                name: "severe_dehydration",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["inconsolable_crying"])) {
            // CTAS 2-3 -> choose higher acuity (2)
            mods.push({
                name: "inconsolable_crying",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["parent_gut_instinct"])) {
            mods.push({
                name: "parent_gut_instinct",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        return mods;
    },
    [ComplaintCode.SKIN_WOUND]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (r["bleeding_controlled"] === "No") {
            mods.push({
                name: "uncontrolled_bleeding",
                ctas_impact: CTASLevel.LEVEL_1,
            });
        }
        if (r["burn_cause"] === "Electrical" ||
            r["burn_cause"] === "Chemical") {
            mods.push({
                name: "electrical_or_chemical_burn",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["burn_appearance"] === "White or waxy" ||
            r["burn_appearance"] === "Charred or black" ||
            r["burn_size"] === "More than 3 palms") {
            mods.push({
                name: "third_degree_or_large_burn",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["depth"] === "Bone or tendon visible") {
            mods.push({
                name: "deep_laceration_bone_tendon",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (r["wound_location"] === "Face" || r["wound_location"] === "Hand") {
            mods.push({
                name: "face_or_hand_laceration",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (isYes(r["red_streaking"]) &&
            (isYes(r["fever_with_rash"]) || r["fever"] === "Yes")) {
            mods.push({
                name: "cellulitis_lymphangitis",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        return mods;
    },
    [ComplaintCode.BACK_JOINT]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (isYes(r["bladder_bowel"])) {
            mods.push({ name: "cauda_equina", ctas_impact: CTASLevel.LEVEL_1 });
        }
        if (isYes(r["joint_swollen"]) && isYes(r["fever"])) {
            mods.push({ name: "septic_joint", ctas_impact: CTASLevel.LEVEL_2 });
        }
        if (isYes(r["bilateral_weakness"])) {
            mods.push({
                name: "bilateral_weakness",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["numbness"]) || isYes(r["weakness"])) {
            mods.push({
                name: "neurological_deficit",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (isYes(r["cancer_history"]) && isYes(r["weight_loss"])) {
            mods.push({
                name: "metastatic_disease_concern",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        return mods;
    },
    [ComplaintCode.URINARY_REPRO]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (r["concern_type"] === "Testicular pain" &&
            isYes(r["sudden_onset"])) {
            mods.push({
                name: "testicular_torsion",
                ctas_impact: CTASLevel.LEVEL_1,
            });
        }
        if (r["pregnant"] === "Yes" &&
            typeof r["weeks_pregnant"] === "number" &&
            r["weeks_pregnant"] > 20 &&
            r["bleeding_severity"] === "Heavy (soaking pad per hour)") {
            mods.push({
                name: "late_pregnancy_heavy_bleed",
                ctas_impact: CTASLevel.LEVEL_1,
            });
        }
        if (r["pregnant"] === "Yes" &&
            r["bleeding_severity"] &&
            r["bleeding_severity"] !== "None" &&
            r["bleeding_severity"] !== "Spotting") {
            mods.push({
                name: "pregnancy_bleeding_ectopic_concern",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (isYes(r["fever"]) && isYes(r["flank_pain"])) {
            mods.push({
                name: "pyelonephritis_suspected",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        return mods;
    },
    [ComplaintCode.EYE_ENT]: (intake) => {
        const r = intake.complaint_responses;
        const mods = [];
        if (isYes(r["chemical_exposure"])) {
            mods.push({
                name: "chemical_eye_exposure",
                ctas_impact: CTASLevel.LEVEL_1,
            });
        }
        if (isYes(r["vision_loss"])) {
            mods.push({
                name: "sudden_vision_loss",
                ctas_impact: CTASLevel.LEVEL_2,
            });
        }
        if (r["can_swallow"] === "Cannot swallow at all" && isYes(r["drooling"])) {
            mods.push({
                name: "airway_compromise",
                ctas_impact: CTASLevel.LEVEL_1,
            });
        }
        if (isYes(r["voice_muffled"]) &&
            r["can_swallow"] === "With difficulty" &&
            isYes(r["throat_fever"])) {
            mods.push({
                name: "peritonsillar_abscess",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        if (r["active_nosebleed"] === "Yes, > 20 minutes uncontrolled") {
            mods.push({
                name: "uncontrolled_nosebleed",
                ctas_impact: CTASLevel.LEVEL_3,
            });
        }
        return mods;
    },
    [ComplaintCode.OTHER]: () => {
        // OTHER defaults to CTAS 3 (handled in defaultCTAS) and always requires clinician review
        return [];
    },
};
export function evaluateSecondOrderModifiers(complaint, intake) {
    const evaluator = evaluators[complaint];
    if (!evaluator)
        return [];
    return evaluator(intake);
}
export const SECOND_ORDER_EVALUATORS = evaluators;
//# sourceMappingURL=second-order-modifiers.js.map