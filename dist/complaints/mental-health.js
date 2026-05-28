import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
export const mentalHealthConfig = {
    code: ComplaintCode.MENTAL_HEALTH,
    label: "Mental Health Concern",
    description: "Anxiety, depression, panic, feeling unsafe, crisis",
    defaultCTAS: CTASLevel.LEVEL_3,
    questions: [
        {
            id: "concern_type",
            prompt: "Primary concern?",
            type: "single",
            options: [
                "Anxiety-Panic",
                "Depression",
                "Crisis",
                "Psychosis",
                "Substance Use",
                "Other",
            ],
            required: true,
        },
        {
            id: "thoughts_self_harm",
            prompt: "Thoughts of harming yourself?",
            type: "yesno",
            required: true,
        },
        {
            id: "thoughts_harm_others",
            prompt: "Thoughts of harming others?",
            type: "yesno",
            required: true,
        },
        {
            id: "plan_to_harm",
            prompt: "Plan to harm yourself or others?",
            type: "yesno",
            required: true,
        },
        {
            id: "feel_safe",
            prompt: "Feel safe where you are?",
            type: "yesno",
            required: true,
        },
        {
            id: "substance_use",
            prompt: "Using alcohol or drugs?",
            type: "yesno",
            required: true,
        },
        {
            id: "overdose",
            prompt: "Taken more medication than prescribed?",
            type: "yesno",
            required: true,
        },
        {
            id: "mh_provider",
            prompt: "Seeing a mental health provider?",
            type: "yesno",
            required: true,
        },
        {
            id: "symptom_duration",
            prompt: "Duration of symptoms?",
            type: "single",
            options: ["Hours", "Days", "Weeks", "Months"],
            required: true,
        },
        {
            id: "daily_activities",
            prompt: "Can you perform daily activities?",
            type: "single",
            options: ["Yes", "Somewhat", "Not at all"],
            required: true,
        },
    ],
};
//# sourceMappingURL=mental-health.js.map