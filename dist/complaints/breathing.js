import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
export const breathingConfig = {
    code: ComplaintCode.BREATHING,
    label: "Breathing Difficulty",
    description: "Shortness of breath, wheezing, can't catch your breath",
    defaultCTAS: CTASLevel.LEVEL_3,
    questions: [
        {
            id: "breathing_severity",
            prompt: "Severity RIGHT NOW?",
            type: "single",
            options: [
                "Mild (can speak in full sentences)",
                "Moderate (can speak in phrases)",
                "Severe (single words only)",
                "Can barely breathe",
            ],
            required: true,
        },
        {
            id: "onset_type",
            prompt: "When did it start?",
            type: "single",
            options: ["Suddenly (minutes)", "Gradually (hours-days)"],
            required: true,
        },
        {
            id: "wheezing",
            prompt: "Wheezing?",
            type: "yesno",
            required: true,
        },
        {
            id: "chest_pain",
            prompt: "Chest pain with breathing?",
            type: "yesno",
            required: true,
        },
        {
            id: "cyanosis",
            prompt: "Lips or fingertips turning blue?",
            type: "single",
            options: ["Yes", "No", "Not sure"],
            required: true,
        },
        {
            id: "asthma_copd_history",
            prompt: "History of asthma or COPD?",
            type: "single",
            options: ["Asthma", "COPD", "Both", "Neither"],
            required: true,
        },
        {
            id: "inhaler_response",
            prompt: "Rescue inhaler used?",
            type: "single",
            options: ["Helped", "No improvement", "Don't have one", "N/A"],
            required: true,
        },
        {
            id: "leg_swelling",
            prompt: "Leg swelling or recent immobility?",
            type: "yesno",
            required: true,
        },
        {
            id: "fever_cough",
            prompt: "Fever or cough?",
            type: "single",
            options: ["Fever only", "Cough only", "Both", "Neither"],
            required: true,
        },
        {
            id: "lie_flat",
            prompt: "Can you lie flat?",
            type: "yesno",
            required: true,
        },
        {
            id: "heart_failure",
            prompt: "History of heart failure?",
            type: "yesno",
            required: true,
        },
    ],
};
//# sourceMappingURL=breathing.js.map