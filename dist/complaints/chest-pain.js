import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
export const chestPainConfig = {
    code: ComplaintCode.CHEST_PAIN,
    label: "Chest Pain or Discomfort",
    description: "Pain, pressure, tightness, or squeezing in your chest",
    defaultCTAS: CTASLevel.LEVEL_3,
    questions: [
        {
            id: "pain_location",
            prompt: "Where exactly is the pain?",
            type: "single",
            options: ["Center", "Left side", "Right side", "All over"],
            required: true,
        },
        {
            id: "pain_character",
            prompt: "What does the pain feel like?",
            type: "single",
            options: [
                "Sharp-stabbing",
                "Pressure-squeezing",
                "Burning",
                "Aching",
                "Tearing",
            ],
            required: true,
        },
        {
            id: "radiation",
            prompt: "Does the pain spread anywhere?",
            type: "multi",
            options: ["Left arm", "Right arm", "Jaw", "Back", "Neck", "Nowhere"],
            required: true,
        },
        {
            id: "positional",
            prompt: "Does the pain change with breathing or movement?",
            type: "yesno",
            required: true,
        },
        {
            id: "associated",
            prompt: "Are you experiencing any of these RIGHT NOW?",
            type: "multi",
            options: [
                "Sweating",
                "Nausea-Vomiting",
                "Dizziness",
                "Palpitations",
                "Feeling of doom",
                "None",
            ],
            required: true,
        },
        {
            id: "heart_history",
            prompt: "Do you have a history of heart problems?",
            type: "yesno",
            required: true,
        },
        {
            id: "recent_immobility",
            prompt: "Have you had recent surgery, long flight, or been immobile?",
            type: "yesno",
            required: true,
        },
        {
            id: "shortness_of_breath",
            prompt: "Are you currently short of breath?",
            type: "yesno",
            required: true,
        },
    ],
};
//# sourceMappingURL=chest-pain.js.map