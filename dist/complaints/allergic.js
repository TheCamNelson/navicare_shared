import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
export const allergicConfig = {
    code: ComplaintCode.ALLERGIC,
    label: "Allergic Reaction",
    description: "Rash, hives, swelling, itching after exposure to something",
    defaultCTAS: CTASLevel.LEVEL_4,
    questions: [
        {
            id: "exposure_source",
            prompt: "Exposure source?",
            type: "single",
            options: ["Food", "Medication", "Insect sting", "Environmental", "Unknown"],
            required: true,
        },
        {
            id: "time_since_exposure",
            prompt: "Time since exposure?",
            type: "single",
            options: ["< 30 minutes", "30 minutes-2 hours", "2-6 hours", "> 6 hours"],
            required: true,
        },
        {
            id: "swelling_location",
            prompt: "Swelling location?",
            type: "multi",
            options: ["Face", "Lips", "Tongue", "Throat", "Eyes", "Hands", "None"],
            required: true,
        },
        {
            id: "breathing_trouble",
            prompt: "Trouble breathing or swallowing?",
            type: "yesno",
            required: true,
        },
        {
            id: "dizzy_faint",
            prompt: "Dizzy or faint?",
            type: "yesno",
            required: true,
        },
        {
            id: "hives",
            prompt: "Hives or rash?",
            type: "single",
            options: ["None", "Localized", "Widespread"],
            required: true,
        },
        {
            id: "epipen",
            prompt: "EpiPen available/used?",
            type: "single",
            options: ["Used it", "Haven't used it", "Don't have one"],
            required: true,
        },
        {
            id: "previous_severe",
            prompt: "Previous severe allergic reaction?",
            type: "yesno",
            required: true,
        },
        {
            id: "gi_symptoms",
            prompt: "GI symptoms (cramps, nausea, vomiting)?",
            type: "yesno",
            required: true,
        },
        {
            id: "reaction_trajectory",
            prompt: "Getting worse, stable, or improving?",
            type: "single",
            options: ["Worse", "Stable", "Improving"],
            required: true,
        },
    ],
};
//# sourceMappingURL=allergic.js.map