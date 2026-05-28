import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
export const urinaryReproConfig = {
    code: ComplaintCode.URINARY_REPRO,
    label: "Urinary or Reproductive Concern",
    description: "Painful urination, discharge, pelvic pain, pregnancy concern",
    defaultCTAS: CTASLevel.LEVEL_4,
    questions: [
        {
            id: "concern_type",
            prompt: "Primary concern type?",
            type: "single",
            options: [
                "Urinary symptoms",
                "Discharge",
                "Pelvic pain",
                "Testicular pain",
                "Pregnancy-related bleeding",
                "Other",
            ],
            required: true,
        },
        {
            id: "fever",
            prompt: "Fever?",
            type: "yesno",
            required: true,
        },
        {
            id: "flank_pain",
            prompt: "Flank or back pain?",
            type: "yesno",
            required: true,
        },
        {
            id: "pregnant",
            prompt: "Pregnancy status?",
            type: "single",
            options: ["Yes", "No", "Unsure", "N/A"],
            required: true,
        },
        {
            id: "weeks_pregnant",
            prompt: "If pregnant, gestational age (weeks)?",
            type: "number",
            min: 0,
            max: 45,
            required: false,
            showIf: (r) => r["pregnant"] === "Yes",
        },
        {
            id: "bleeding_severity",
            prompt: "If bleeding, severity?",
            type: "single",
            options: [
                "None",
                "Spotting",
                "Moderate",
                "Heavy (soaking pad per hour)",
            ],
            required: false,
        },
        {
            id: "sudden_onset",
            prompt: "If testicular pain, sudden onset?",
            type: "yesno",
            required: false,
            showIf: (r) => r["concern_type"] === "Testicular pain",
        },
        {
            id: "nausea_vomiting",
            prompt: "Nausea or vomiting?",
            type: "yesno",
            required: true,
        },
        {
            id: "symptom_duration",
            prompt: "Duration of symptoms?",
            type: "single",
            options: ["< 24 hours", "1-3 days", "3-7 days", "> 1 week"],
            required: true,
        },
    ],
};
//# sourceMappingURL=urinary-repro.js.map